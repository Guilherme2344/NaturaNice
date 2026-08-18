package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.Customer;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/customers")
@Produces(MediaType.APPLICATION_JSON)
public class CustomerResource {

    @GET
    public List<Customer> getAll() {
        return Customer.listAllSorted();
    }
}
