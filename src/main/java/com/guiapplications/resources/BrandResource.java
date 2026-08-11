package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.Brand;
import com.guiapplications.services.BrandService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
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
	
	// delete brand by id
	@DELETE
	@Path("/{id}")
	public Response delete(@PathParam("id") Long id) {
		brandService.delete(id);
		return Response.noContent().build();
	}
}
