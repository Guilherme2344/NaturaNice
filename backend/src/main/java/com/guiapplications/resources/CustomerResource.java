package com.guiapplications.resources;

import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.CustomerPaymentRequestDTO;
import com.guiapplications.entities.dto.CustomerRequestDTO;
import com.guiapplications.entities.dto.CustomerResponseDTO;
import com.guiapplications.entities.dto.CustomerSummaryDTO;
import com.guiapplications.services.CustomerService;
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

@Path("/customers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomerResource {

    @Inject
    CustomerService customerService;

    // create a customer
    @POST
    public Response create(
            @Valid CustomerRequestDTO dto,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        CustomerResponseDTO createdCustomer = customerService.create(dto, user);
        return Response.status(Response.Status.CREATED)
                       .entity(createdCustomer)
                       .build();
    }

    // get all customers
    @GET
    public Response getAll(
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        return Response.ok(customerService.listAll(user)).build();
    }

    // search customer by name
    @GET
    @Path("/search")
    public Response search(
            @QueryParam("name") String name,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        List<CustomerResponseDTO> customers = customerService.search(name, user);
        return Response.ok(customers).build();
    }

    // get customer purchase summary and debt status
    @GET
    @Path("/{id}/summary")
    public Response getSummary(
            @PathParam("id") UUID id,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        CustomerSummaryDTO summary = customerService.getCustomerSummary(id, user);
        return Response.ok(summary).build();
    }

    // record additional customer payment towards outstanding debts
    @POST
    @Path("/{id}/payments")
    public Response addPayment(
            @PathParam("id") UUID id,
            @Valid CustomerPaymentRequestDTO dto,
            @HeaderParam("Authorization") String authHeader,
            @HeaderParam("X-User-Id") String userIdHeader
    ) {
        User user = UserResolver.resolveUser(authHeader, userIdHeader);
        CustomerSummaryDTO updatedSummary = customerService.addCustomerPayment(id, dto.amount(), user);
        return Response.ok(updatedSummary).build();
    }

    // update a customer
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") UUID id, @Valid CustomerRequestDTO dto) {
        CustomerResponseDTO updatedCustomer = customerService.update(id, dto);
        return Response.ok(updatedCustomer).build();
    }

    // delete customer by id
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") UUID id) {
        customerService.delete(id);
        return Response.noContent().build();
    }
}
