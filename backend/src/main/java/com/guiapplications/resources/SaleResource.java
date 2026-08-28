package com.guiapplications.resources;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.SaleRequestDTO;
import com.guiapplications.entities.dto.SaleResponseDTO;
import com.guiapplications.services.SaleService;
import com.guiapplications.utils.UserResolver;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
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
    public Response createSale(
            @Valid SaleRequestDTO dto,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        SaleResponseDTO saleResponse = saleService.createSale(dto, user);
        return Response.status(Response.Status.CREATED)
                       .entity(saleResponse)
                       .build();
    }

    public record PaymentRequest(BigDecimal amount) {}

    @POST
    @Path("/{id}/payments")
    public Response addSalePayment(
            @PathParam("id") UUID saleId,
            PaymentRequest request,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        saleService.addSalePayment(saleId, request.amount(), user);
        return Response.ok(Map.of("message", "Abatimento de pagamento registrado com sucesso.")).build();
    }
}
