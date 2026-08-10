package com.guiapplications.resources;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.guiapplications.entities.dto.ProductResponseDTO;
import com.guiapplications.services.ProductService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
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
	
	// search all products
	@GET
    public Response getAll() {
        return Response.ok(productService.listAll()).build();
    }
	
	@GET
    @Path("/search")
    public Response search(
            @QueryParam("query") String query,         // wide search
            @QueryParam("familyName") String familyName,     // family filter
            @QueryParam("brandName") String brandName,       // brand filter
            @QueryParam("categoryName") String categoryName, // category filter
            @QueryParam("maxExpirationDate") String maxExpirationDate // date limit (dd/MM/yyyy)
    ) {
		
		final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		
        LocalDate dateLimit = (maxExpirationDate != null && !maxExpirationDate.isBlank()) 
                ? LocalDate.parse(maxExpirationDate, formatter)
                : null;

        List<ProductResponseDTO> result = productService.searchProducts(
                query, familyName, brandName, categoryName, dateLimit
        );
        
        return Response.ok(result).build();
    }
}
