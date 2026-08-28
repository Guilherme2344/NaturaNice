package com.guiapplications.resources;

import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.FamilyRequestDTO;
import com.guiapplications.entities.dto.FamilyResponseDTO;
import com.guiapplications.services.FamilyService;
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

@Path("/families")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FamilyResource {

    @Inject
    FamilyService familyService;

    // create Family
    @POST
    public Response create(
            @Valid FamilyRequestDTO dto,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        FamilyResponseDTO createdFamily = familyService.create(dto, user);
        return Response.status(Response.Status.CREATED)
                       .entity(createdFamily)
                       .build();
    }

    // get all families
    @GET
    public Response getAll(
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        return Response.ok(familyService.listAll(user)).build();
    }

    // search Family by name
    @GET
    @Path("/search")
    public Response search(
            @QueryParam("name") String name,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        List<FamilyResponseDTO> families = familyService.search(name, user);
        return Response.ok(families).build();
    }

    // update a Family
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") UUID id, @Valid FamilyRequestDTO dto) {
        FamilyResponseDTO updatedFamily = familyService.update(id, dto);
        return Response.ok(updatedFamily).build();
    }

    // delete Family by id
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") UUID id) {
        familyService.delete(id);
        return Response.noContent().build();
    }
}
