package com.guiapplications.resources;

import java.util.List;

import com.guiapplications.entities.Customer;
import com.guiapplications.entities.User;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/customers")
@Produces(MediaType.APPLICATION_JSON)
public class CustomerResource {

    @GET
    public List<Customer> getAll(@HeaderParam("X-User-Id") Long userId) {
        User user = userId != null ? User.findById(userId) : null;
        return Customer.listByUser(user);
    }
}
