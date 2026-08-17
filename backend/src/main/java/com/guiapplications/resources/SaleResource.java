package com.guiapplications.resources;

import com.guiapplications.entities.dto.SaleRequestDTO;
import com.guiapplications.entities.dto.SaleResponseDTO;
import com.guiapplications.services.SaleService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/sales")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SaleResource {

    @Inject
    SaleService saleService;

    @POST
    public Response createSale(SaleRequestDTO dto) {
        SaleResponseDTO response = saleService.createSale(dto);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
