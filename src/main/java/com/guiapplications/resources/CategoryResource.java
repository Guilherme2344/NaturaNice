package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.Category;
import com.guiapplications.services.CategoryService;

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

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {
	
	@Inject
	CategoryService categoryService;
	
	// get all categories
	@GET
    public Response getAll() {
        return Response.ok(categoryService.listAll()).build();
    }
	
	// get category by name
	@GET
	@Path("/search")
	public Response search(@QueryParam("name") String name) {
	    List<Category> categories = Category.findByName(name);
	    return Response.ok(categories).build();
	}
	
	// delete category by id
	@DELETE
	@Path("/{id}")
	public Response delete(@PathParam("id") Long id) {
		categoryService.delete(id);
		return Response.noContent().build();
	}
}
