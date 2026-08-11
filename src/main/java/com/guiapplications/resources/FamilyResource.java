package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.Family;
import com.guiapplications.entities.dto.FamilyRequestDTO;
import com.guiapplications.entities.dto.FamilyResponseDTO;
import com.guiapplications.services.FamilyService;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
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
	public Response create(@Valid FamilyRequestDTO dto) {
	    FamilyResponseDTO createdFamily = familyService.create(dto);
	    return Response.status(Response.Status.CREATED)
	                   .entity(createdFamily)
	                   .build();
	}
	
	// get all families
	@GET
    public Response getAll() {
        return Response.ok(familyService.listAll()).build();
    }
	
	// get family by name
	@GET
	@Path("/search")
	public Response search(@QueryParam("name") String name) {
	    List<Family> families = Family.findByName(name);
	    return Response.ok(families).build();
	}
	
	// delete family by id
	@DELETE
	@Path("/{id}")
	public Response delete(@PathParam("id") Long id) {
		familyService.delete(id);
		return Response.noContent().build();
	}
}
