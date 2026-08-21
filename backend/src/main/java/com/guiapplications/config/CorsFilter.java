package com.guiapplications.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

// Dynamic CORS Security Filter
@Provider
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Inject
    @ConfigProperty(name = "quarkus.http.cors.origins", defaultValue = "http://localhost:5173,http://localhost:3000")
    String allowedOriginsConfig;

    private List<String> getAllowedOrigins() {
        return Arrays.stream(allowedOriginsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    private String resolveAllowedOrigin(String requestOrigin) {
        List<String> origins = getAllowedOrigins();
        if (origins.contains("*")) {
            return "*";
        }
        if (requestOrigin != null && origins.contains(requestOrigin)) {
            return requestOrigin;
        }
        return origins.isEmpty() ? "http://localhost:5173" : origins.get(0);
    }

    private String resolveAllowedHeaders(ContainerRequestContext request) {
        String reqHeaders = request.getHeaderString("Access-Control-Request-Headers");
        if (reqHeaders != null && !reqHeaders.isBlank()) {
            return reqHeaders;
        }
        return "*";
    }

    @Override
    public void filter(ContainerRequestContext request) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            String origin = request.getHeaderString("Origin");
            String allowOrigin = resolveAllowedOrigin(origin);
            String allowHeaders = resolveAllowedHeaders(request);

            request.abortWith(Response.ok()
                    .header("Access-Control-Allow-Origin", allowOrigin)
                    .header("Access-Control-Allow-Headers", allowHeaders)
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
                    .header("Access-Control-Max-Age", "86400")
                    .build());
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        String origin = requestContext.getHeaderString("Origin");
        String allowOrigin = resolveAllowedOrigin(origin);
        String allowHeaders = resolveAllowedHeaders(requestContext);

        responseContext.getHeaders().putSingle("Access-Control-Allow-Origin", allowOrigin);
        responseContext.getHeaders().putSingle("Access-Control-Allow-Headers", allowHeaders);
        responseContext.getHeaders().putSingle("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
    }
}