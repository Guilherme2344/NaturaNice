package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.dto.BrandRequestDTO;
import com.guiapplications.entities.dto.BrandResponseDTO;
import com.guiapplications.services.BrandService;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
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
	
	// create a brand
	@POST
	public Response create(@Valid BrandRequestDTO dto) {
	    BrandResponseDTO createdBrand = brandService.create(dto);
	    return Response.status(Response.Status.CREATED)
	                   .entity(createdBrand)
	                   .build();
	}
	
	// get all brands
	@GET
    public Response getAll() {
        return Response.ok(brandService.listAll()).build();
    }
	
	// get brand by name
	@GET
	@Path("/search")
	public Response search(@QueryParam("name") String name) {
	    List<Brand> brands = Brand.findByName(name);
	    return Response.ok(brands).build();
	}
	
	// update a brand
	@PUT
	@Path("/{id}")
	public Response update(@PathParam("id") Long id, @Valid BrandRequestDTO dto) {
	    BrandResponseDTO updatedBrand = brandService.update(id, dto);
	    return Response.ok(updatedBrand).build();
	}
	
	// delete brand by id
	@DELETE
	@Path("/{id}")
	public Response delete(@PathParam("id") Long id) {
		brandService.delete(id);
		return Response.noContent().build();
	}
}
