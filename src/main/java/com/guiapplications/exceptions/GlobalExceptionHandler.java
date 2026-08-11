package com.guiapplications.exceptions;

import com.guiapplications.exceptions.dto.ErrorResponseDTO;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider // register global mapper in Quarkus
public class GlobalExceptionHandler implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {
        
        // resource not found (404)
        if (exception instanceof ResourceNotFoundException) {
            ErrorResponseDTO error = new ErrorResponseDTO(
                Response.Status.NOT_FOUND.getStatusCode(),
                "Não Encontrado",
                exception.getMessage()
            );
            return Response.status(Response.Status.NOT_FOUND).entity(error).build();
        }

        // FK conflict (409)
        if (exception instanceof ResourceInUseException) {
            ErrorResponseDTO error = new ErrorResponseDTO(
                Response.Status.CONFLICT.getStatusCode(),
                "Conflito no banco",
                exception.getMessage()
            );
            return Response.status(Response.Status.CONFLICT).entity(error).build();
        }

        // generic error (500)
        ErrorResponseDTO error = new ErrorResponseDTO(
            Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
            "Erro interno no servidor",
            "Ocorreu um erro interno no servidor."
        );
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
    }
}
