package com.guiapplications.resources;

import java.util.Map;

import com.guiapplications.entities.dto.ChangePasswordRequestDTO;
import com.guiapplications.entities.dto.ForgotPasswordRequestDTO;
import com.guiapplications.entities.dto.LoginRequestDTO;
import com.guiapplications.entities.dto.LoginResponseDTO;
import com.guiapplications.entities.dto.ResetPasswordRequestDTO;
import com.guiapplications.entities.dto.UserResponseDTO;
import com.guiapplications.entities.dto.VerifyCodeRequestDTO;
import com.guiapplications.services.AuthService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public Response login(LoginRequestDTO dto) {
        try {
            LoginResponseDTO response = authService.login(dto);
            return Response.ok(response).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/change-first-password")
    public Response changeFirstPassword(ChangePasswordRequestDTO dto) {
        try {
            UserResponseDTO user = authService.changeFirstPassword(dto);
            return Response.ok(user).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/forgot-password")
    public Response forgotPassword(ForgotPasswordRequestDTO dto) {
        try {
            authService.forgotPassword(dto);
            return Response.ok(Map.of("message", "Código de recuperação enviado para o e-mail se cadastrado.")).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/verify-code")
    public Response verifyCode(VerifyCodeRequestDTO dto) {
        boolean valid = authService.verifyCode(dto);
        if (!valid) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", "Código inválido ou expirado."))
                    .build();
        }
        return Response.ok(Map.of("valid", true)).build();
    }

    @POST
    @Path("/reset-password")
    public Response resetPassword(ResetPasswordRequestDTO dto) {
        try {
            authService.resetPassword(dto);
            return Response.ok(Map.of("message", "Senha redefinida com sucesso.")).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        }
    }
}
