package com.guiapplications.resources;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.guiapplications.entities.dto.ProductRequestDTO;
import com.guiapplications.entities.dto.ProductResponseDTO;
import com.guiapplications.services.ProductService;

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

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {
	
	@Inject
	ProductService productService;
	
	// create a Product
	@POST
	public Response create(@Valid ProductRequestDTO dto, @HeaderParam("X-User-Id") Long userId) {
	    ProductResponseDTO createdProduct = productService.create(dto, userId);
	    return Response.status(Response.Status.CREATED)
	                   .entity(createdProduct)
	                   .build();
	}
	
	// get all products
	@GET
    public Response getAll(@HeaderParam("X-User-Id") Long userId) {
        return Response.ok(productService.listAll(userId)).build();
    }
	
	// search products by any criterion below
	@GET
    @Path("/search")
    public Response search(
            @QueryParam("query") String query,         // wide search
            @QueryParam("familyName") String familyName,     // family filter
            @QueryParam("ProductName") String ProductName,       // Product filter
            @QueryParam("categoryName") String categoryName, // category filter
            @QueryParam("maxExpirationDate") String maxExpirationDate, // date limit (dd/MM/yyyy)
            @HeaderParam("X-User-Id") Long userId
    ) {
		
		final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		
        LocalDate dateLimit = (maxExpirationDate != null && !maxExpirationDate.isBlank()) 
                ? LocalDate.parse(maxExpirationDate, formatter)
                : null;

        List<ProductResponseDTO> result = productService.searchProducts(
                query, familyName, ProductName, categoryName, dateLimit, userId
        );
        
        return Response.ok(result).build();
    }
	
	// get all expired products
	@GET
    @Path("/expired")
    public Response getExpiredProducts(@HeaderParam("X-User-Id") Long userId) {
        List<ProductResponseDTO> products = productService.findExpired(userId);
        return Response.ok(products).build();
    }

	// get all near expiration products
    @GET
    @Path("/near-expiration")
    public Response getNearExpirationProducts(@HeaderParam("X-User-Id") Long userId) {
        List<ProductResponseDTO> products = productService.findNearExpiration(userId);
        return Response.ok(products).build();
    }
	
	// update a product
	@PUT
	@Path("/{id}")
	public Response update(@PathParam("id") Long id, @Valid ProductRequestDTO dto) {
	    ProductResponseDTO updatedProduct = productService.update(id, dto);
	    return Response.ok(updatedProduct).build();
	}
	
	// delete product by id
	@DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        productService.delete(id);
        return Response.noContent().build(); // HTTP 204 No Content
    }
}
