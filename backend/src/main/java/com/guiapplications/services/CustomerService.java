package com.guiapplications.services;

import java.util.List;

import com.guiapplications.entities.Customer;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.CustomerRequestDTO;
import com.guiapplications.entities.dto.CustomerResponseDTO;
import com.guiapplications.exceptions.ResourceAlreadyExistsException;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

// Service class for managing Customer operations
@ApplicationScoped
public class CustomerService {

    @Transactional
    public CustomerResponseDTO create(CustomerRequestDTO dto) {
        return create(dto, null);
    }

    // create a Customer
    @Transactional
    public CustomerResponseDTO create(CustomerRequestDTO dto, Long userId) {
        String trimmedName = dto.name().trim();
        User user = userId != null ? User.findById(userId) : null;

        // check if a customer with the same name already exists for this user
        Customer existing = Customer.findByNameAndUser(trimmedName, user);
        if (existing != null) {
            throw new ResourceAlreadyExistsException("Já existe um cliente cadastrado com o nome: " + trimmedName);
        }

        Customer customer = new Customer();
        customer.name = trimmedName;
        customer.user = user;
        customer.persist();
        return CustomerResponseDTO.fromEntity(customer);
    }

    // list all customers
    public List<CustomerResponseDTO> listAll(Long userId) {
        User user = userId != null ? User.findById(userId) : null;
        List<Customer> customers = Customer.listByUser(user);
        return customers.stream()
                .map(CustomerResponseDTO::fromEntity)
                .toList();
    }

    // search customers by name
    public List<CustomerResponseDTO> search(String name, Long userId) {
        User user = userId != null ? User.findById(userId) : null;
        Customer customer = Customer.findByNameAndUser(name, user);
        if (customer == null) {
            return List.of();
        }
        return List.of(CustomerResponseDTO.fromEntity(customer));
    }

    // update a customer
    @Transactional
    public CustomerResponseDTO update(Long id, CustomerRequestDTO dto) {
        Customer customer = Customer.findById(id);
        if (customer == null) {
            throw new ResourceNotFoundException("Cliente com ID " + id + " não encontrado.");
        }

        String trimmedName = dto.name().trim();

        // check for duplicate customer names
        long duplicateCount = Customer.count(
            "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2",
            trimmedName, id
        );
        if (duplicateCount > 0) {
            throw new ResourceAlreadyExistsException("Já existe outro cliente cadastrado com o nome: " + trimmedName);
        }

        customer.name = trimmedName;
        return CustomerResponseDTO.fromEntity(customer);
    }

    // delete customer by id
    @Transactional
    public void delete(Long id) {
        Customer customer = Customer.findById(id);
        if (customer == null) {
            throw new ResourceNotFoundException("Cliente com ID " + id + " não foi encontrado.");
        }
        try {
            customer.delete();
            Customer.flush();
        } catch (ConstraintViolationException | PersistenceException e) {
            throw new ResourceInUseException("Não é possível excluir o cliente " + customer.name + " pois existem vendas associadas a ele.");
        }
    }
}
