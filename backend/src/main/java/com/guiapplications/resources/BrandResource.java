package com.guiapplications.resources;

import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.BrandRequestDTO;
import com.guiapplications.entities.dto.BrandResponseDTO;
import com.guiapplications.services.BrandService;
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

@Path("/brands")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BrandResource {

	@Inject
	BrandService brandService;
	
	// create brand
	@POST
	public Response create(
			@Valid BrandRequestDTO dto,
			@HeaderParam("Authorization") String authHeader,
			@HeaderParam("X-User-Id") String userIdHeader
	) {
		User user = UserResolver.resolveUser(authHeader, userIdHeader);
		BrandResponseDTO createdBrand = brandService.create(dto, user);
		return Response.status(Response.Status.CREATED)
				       .entity(createdBrand)
				       .build();
	}
	
	// get all brands
	@GET
	public Response getAll(
			@HeaderParam("Authorization") String authHeader,
			@HeaderParam("X-User-Id") String userIdHeader
	) {
		User user = UserResolver.resolveUser(authHeader, userIdHeader);
		return Response.ok(brandService.listAll(user)).build();
	}

	// search brand by name
	@GET
	@Path("/search")
	public Response search(
			@QueryParam("name") String name,
			@HeaderParam("Authorization") String authHeader,
			@HeaderParam("X-User-Id") String userIdHeader
	) {
		User user = UserResolver.resolveUser(authHeader, userIdHeader);
		List<BrandResponseDTO> brands = brandService.search(name, user);
		return Response.ok(brands).build();
	}
	
	// update a brand
	@PUT
	@Path("/{id}")
	public Response update(@PathParam("id") UUID id, @Valid BrandRequestDTO dto) {
		BrandResponseDTO updatedBrand = brandService.update(id, dto);
		return Response.ok(updatedBrand).build();
	}
	
	// delete brand by id
	@DELETE
	@Path("/{id}")
	public Response delete(@PathParam("id") UUID id) {
		brandService.delete(id);
		return Response.noContent().build();
	}
}
