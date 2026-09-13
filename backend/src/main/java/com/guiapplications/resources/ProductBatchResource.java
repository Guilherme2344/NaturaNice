package com.guiapplications.resources;

import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ProductBatchRequestDTO;
import com.guiapplications.entities.dto.ProductBatchResponseDTO;
import com.guiapplications.services.ProductBatchService;
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
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/product-batches")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductBatchResource {

    @Inject
    ProductBatchService batchService;

    @POST
    public Response create(
            @Valid ProductBatchRequestDTO dto,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        ProductBatchResponseDTO createdBatch = batchService.createBatch(dto, user);
        return Response.status(Response.Status.CREATED)
                       .entity(createdBatch)
                       .build();
    }

    @PUT
    @Path("/{id}")
    public Response update(
            @PathParam("id") UUID id,
            @Valid ProductBatchRequestDTO dto,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        ProductBatchResponseDTO updatedBatch = batchService.updateBatch(id, dto, user);
        return Response.ok(updatedBatch).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(
            @PathParam("id") UUID id,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        batchService.deleteBatch(id, user);
        return Response.noContent().build();
    }

    @GET
    @Path("/product/{productId}")
    public Response getByProduct(
            @PathParam("productId") UUID productId,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        List<ProductBatchResponseDTO> batches = batchService.findByProduct(productId, user);
        return Response.ok(batches).build();
    }

    @GET
    public Response getAll(
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        List<ProductBatchResponseDTO> batches = batchService.listAll(user);
        return Response.ok(batches).build();
    }
}
