package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.dto.CustomerRequestDTO;
import com.guiapplications.entities.dto.CustomerResponseDTO;
import com.guiapplications.services.CustomerService;

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
    public Response create(@Valid CustomerRequestDTO dto, @HeaderParam("X-User-Id") Long userId) {
        CustomerResponseDTO createdCustomer = customerService.create(dto, userId);
        return Response.status(Response.Status.CREATED)
                       .entity(createdCustomer)
                       .build();
    }

    // get all customers
    @GET
    public Response getAll(@HeaderParam("X-User-Id") Long userId) {
        return Response.ok(customerService.listAll(userId)).build();
    }

    // search customer by name
    @GET
    @Path("/search")
    public Response search(@QueryParam("name") String name, @HeaderParam("X-User-Id") Long userId) {
        List<CustomerResponseDTO> customers = customerService.search(name, userId);
        return Response.ok(customers).build();
    }

    // update a customer
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, @Valid CustomerRequestDTO dto) {
        CustomerResponseDTO updatedCustomer = customerService.update(id, dto);
        return Response.ok(updatedCustomer).build();
    }

    // delete customer by id
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        customerService.delete(id);
        return Response.noContent().build();
    }
}
