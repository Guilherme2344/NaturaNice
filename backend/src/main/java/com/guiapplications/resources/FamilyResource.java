package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.dto.FamilyRequestDTO;
import com.guiapplications.entities.dto.FamilyResponseDTO;
import com.guiapplications.services.FamilyService;

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
	
	// create a family
	@POST
	public Response create(@Valid FamilyRequestDTO dto, @HeaderParam("X-User-Id") Long userId) {
	    FamilyResponseDTO createdFamily = familyService.create(dto, userId);
	    return Response.status(Response.Status.CREATED)
	                   .entity(createdFamily)
	                   .build();
	}
	
	// get all families
	@GET
    public Response getAll(@HeaderParam("X-User-Id") Long userId) {
        return Response.ok(familyService.listAll(userId)).build();
    }
	
	// get family by name
	@GET
	@Path("/search")
	public Response search(@QueryParam("name") String name, @HeaderParam("X-User-Id") Long userId) {
	    List<FamilyResponseDTO> families = familyService.search(name, userId);
	    return Response.ok(families).build();
	}
	
	// update a family
	@PUT
	@Path("/{id}")
	public Response update(@PathParam("id") Long id, @Valid FamilyRequestDTO dto) {
	    FamilyResponseDTO updatedFamily = familyService.update(id, dto);
	    return Response.ok(updatedFamily).build();
	}
	
	// delete family by id
	@DELETE
	@Path("/{id}")
	public Response delete(@PathParam("id") Long id) {
		familyService.delete(id);
		return Response.noContent().build();
	}
}
