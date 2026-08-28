package com.guiapplications.resources;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ProductRequestDTO;
import com.guiapplications.entities.dto.ProductResponseDTO;
import com.guiapplications.services.ProductService;
import com.guiapplications.utils.UserResolver;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @Inject
    ProductService productService;

    // create a product
    @POST
    public Response create(
            @Valid ProductRequestDTO dto,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        ProductResponseDTO createdProduct = productService.create(dto, user);
        return Response.status(Response.Status.CREATED)
                       .entity(createdProduct)
                       .build();
    }

    // get all products
    @GET
    public Response getAll(
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        List<ProductResponseDTO> products = productService.listAll(user);
        return Response.ok(products).build();
    }

    // list expired products
    @GET
    @Path("/expired")
    public Response getExpired(
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        List<ProductResponseDTO> products = productService.findExpired(user);
        return Response.ok(products).build();
    }

    // list near expiration products
    @GET
    @Path("/near-expiration")
    public Response getNearExpiration(
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        List<ProductResponseDTO> products = productService.findNearExpiration(user);
        return Response.ok(products).build();
    }

    // search products with filters
    @GET
    @Path("/search")
    public Response search(
            @QueryParam("query") String query,
            @QueryParam("familyName") String familyName,
            @QueryParam("brandName") String brandName,
            @QueryParam("categoryName") String categoryName,
            @QueryParam("maxExpDate") String maxExpDate,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        LocalDate parsedDate = (maxExpDate != null && !maxExpDate.isBlank()) ? LocalDate.parse(maxExpDate) : null;
        List<ProductResponseDTO> products = productService.searchProducts(query, familyName, brandName, categoryName, parsedDate, user);
        return Response.ok(products).build();
    }

    // update a product
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") UUID id, @Valid ProductRequestDTO dto) {
        ProductResponseDTO updatedProduct = productService.update(id, dto);
        return Response.ok(updatedProduct).build();
    }

    // delete product by id
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") UUID id) {
        productService.delete(id);
        return Response.noContent().build();
    }
}
