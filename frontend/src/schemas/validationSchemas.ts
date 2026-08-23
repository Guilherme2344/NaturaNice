import * as yup from 'yup';

// Validation schema for product creation and edition
export const productSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required('Por favor, informe o nome do produto.')
        .min(2, 'O nome do produto deve ter no mínimo 2 caracteres.')
        .max(255, 'O nome do produto deve ter no máximo 255 caracteres.'),
    brandId: yup
        .string()
        .nullable()
        .required('Por favor, selecione uma marca.'),
    categoryId: yup
        .string()
        .nullable()
        .required('Por favor, selecione uma categoria.'),
    familyId: yup
        .string()
        .nullable()
        .required('Por favor, selecione uma família.'),
    quantity: yup
        .number()
        .typeError('A quantidade deve ser um número.')
        .min(0, 'A quantidade deve ser maior ou igual a 0.')
        .required('Informe a quantidade.'),
    expirationDate: yup
        .string()
        .required('Por favor, selecione a data de vencimento.'),
    purchasePrice: yup
        .number()
        .typeError('O preço de compra deve ser um número.')
        .min(0, 'O preço de compra não pode ser negativo.')
        .required('Informe o preço de compra.'),
    sellingPrice: yup
        .number()
        .typeError('O preço de venda deve ser um número.')
        .moreThan(0, 'Por favor, informe um preço de venda maior que R$ 0,00.')
        .required('Informe o preço de venda.'),
});

// Validation schema for brand, category, and family forms
export const entitySchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required('Por favor, informe o nome.')
        .min(2, 'O nome deve ter no mínimo 2 caracteres.')
        .max(100, 'O nome deve ter no máximo 100 caracteres.'),
});

// Validation schema for sale registration with dynamic stock limit check
export const saleSchema = (availableStock: number) =>
    yup.object().shape({
        quantity: yup
            .number()
            .typeError('Informe uma quantidade válida.')
            .min(1, 'A quantidade vendida deve ser de no mínimo 1 un.')
            .max(
                availableStock,
                `Quantidade superior ao estoque disponível (${availableStock} un.).`
            )
            .required('Informe a quantidade.'),
        sellingPrice: yup
            .number()
            .typeError('Informe o preço de venda unitário.')
            .moreThan(
                0,
                'O preço de venda unitário deve ser maior que R$ 0,00.'
            )
            .required('Informe o preço de venda.'),
    });

// Validation schema for user creation by admin
export const userAdminSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required('Por favor, informe o nome do usuário.')
        .min(2, 'O nome deve conter pelo menos 2 caracteres.')
        .max(100, 'O nome deve conter no máximo 100 caracteres.'),
    email: yup
        .string()
        .trim()
        .required('Por favor, informe o e-mail de acesso.')
        .email(
            'Por favor, informe um endereço de e-mail válido (ex: nome@dominio.com).'
        )
        .max(255, 'O e-mail deve conter no máximo 255 caracteres.'),
});

// Validation schema for user login
export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .trim()
        .required('Por favor, digite seu e-mail de acesso.')
        .email('Por favor, informe um endereço de e-mail válido.')
        .max(150, 'O e-mail deve conter no máximo 150 caracteres.'),
    password: yup.string().required('Por favor, digite sua senha.'),
});

// Validation schema for password reset
export const passwordResetSchema = yup.object().shape({
    newPassword: yup
        .string()
        .required('Informe a nova senha.')
        .min(6, 'A nova senha deve possuir no mínimo 6 caracteres.')
        .max(100, 'A nova senha deve possuir no máximo 100 caracteres.'),
    confirmPassword: yup
        .string()
        .required('Confirme a nova senha.')
        .oneOf([yup.ref('newPassword')], 'As senhas informadas não coincidem.'),
});

// Helper function to validate form data against a Yup schema and return field errors
export async function validateWithYup<T extends yup.AnyObject>(
    schema: yup.ObjectSchema<T>,
    data: any
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
    try {
        await schema.validate(data, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (err) {
        if (err instanceof yup.ValidationError) {
            const errors: Record<string, string> = {};
            err.inner.forEach((error) => {
                if (error.path && !errors[error.path]) {
                    errors[error.path] = error.message;
                }
            });
            return { isValid: false, errors };
        }
        return { isValid: false, errors: {} };
    }
}
