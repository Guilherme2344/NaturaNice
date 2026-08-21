package com.guiapplications.resources;

import java.util.List;
import java.util.Map;

import com.guiapplications.entities.dto.CreateUserRequestDTO;
import com.guiapplications.entities.dto.UserResponseDTO;
import com.guiapplications.services.UserService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/admin/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    @GET
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @POST
    public Response createUser(CreateUserRequestDTO dto) {
        try {
            UserResponseDTO user = userService.createUser(dto);
            return Response.status(Response.Status.CREATED).entity(user).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") Long id) {
        userService.deleteUser(id);
        return Response.noContent().build();
    }
}
