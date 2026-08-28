package com.guiapplications.resources;

import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.CategoryRequestDTO;
import com.guiapplications.entities.dto.CategoryResponseDTO;
import com.guiapplications.services.CategoryService;
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

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {

	@Inject
	CategoryService categoryService;
	
	// create Category
	@POST
	public Response create(
			@Valid CategoryRequestDTO dto,
			@HeaderParam("Authorization") String authHeader,
			@HeaderParam("X-User-Id") String userIdHeader
	) {
		User user = UserResolver.resolveUser(authHeader, userIdHeader);
		CategoryResponseDTO createdCategory = categoryService.create(dto, user);
		return Response.status(Response.Status.CREATED)
				       .entity(createdCategory)
				       .build();
	}
	
	// get all Categories
	@GET
	public Response getAll(
			@HeaderParam("Authorization") String authHeader,
			@HeaderParam("X-User-Id") String userIdHeader
	) {
		User user = UserResolver.resolveUser(authHeader, userIdHeader);
		return Response.ok(categoryService.listAll(user)).build();
	}

	// search Category by name
	@GET
	@Path("/search")
	public Response search(
			@QueryParam("name") String name,
			@HeaderParam("Authorization") String authHeader,
			@HeaderParam("X-User-Id") String userIdHeader
	) {
		User user = UserResolver.resolveUser(authHeader, userIdHeader);
		List<CategoryResponseDTO> categories = categoryService.search(name, user);
		return Response.ok(categories).build();
	}
	
	// update a Category
	@PUT
	@Path("/{id}")
	public Response update(@PathParam("id") UUID id, @Valid CategoryRequestDTO dto) {
		CategoryResponseDTO updatedCategory = categoryService.update(id, dto);
		return Response.ok(updatedCategory).build();
	}
	
	// delete Category by id
	@DELETE
	@Path("/{id}")
	public Response delete(@PathParam("id") UUID id) {
		categoryService.delete(id);
		return Response.noContent().build();
	}
}
