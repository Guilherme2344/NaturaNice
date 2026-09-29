import type { OptionsFilter } from '@mantine/core';

/**
 * Remove acentos e converte texto para minúsculas para buscas insensíveis a acentos.
 * Exemplo: "Família" -> "familia", "Hidratação" -> "hidratacao"
 */
export const normalizeText = (text: string = ''): string => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

/**
 * Filtro customizado para componentes Mantine (Select, Autocomplete, Combobox)
 * que ignora maiúsculas/minúsculas e acentos (ex: busca "maquiagem" encontra "Maquiagem").
 */
export const accentInsensitiveFilter: OptionsFilter = ({ options, search }) => {
    const query = normalizeText(search.trim());
    if (!query) return options;

    return options.filter((item) => {
        if ('group' in item) {
            const matchedItems = item.items.filter((subItem) =>
                normalizeText(subItem.label || subItem.value).includes(query)
            );
            return matchedItems.length > 0;
        }
        return normalizeText(item.label || item.value).includes(query);
    });
};

/**
 * Remove qualquer conteúdo entre parênteses (incluindo os próprios parênteses)
 * e sufixos indesejados como " - AGN" para exibição limpa em mensagens do WhatsApp.
 * Exemplos:
 *   "Sabonete Tododia (AGN)" -> "Sabonete Tododia"
 *   "Sabonete Tododia - AGN" -> "Sabonete Tododia"
 *   "Pó compacto claro 20 (Refil)" -> "Pó compacto claro 20"
 *   "Base Glam (2 un.)" -> "Base Glam"
 */
export const cleanProductNameForWhatsapp = (name: string = ''): string => {
    return name
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\s*[-–—]\s*AGN\b/gi, '')
        .replace(/[()]/g, '')
        .trim();
};

/**
 * Remove qualquer conteúdo entre parênteses (incluindo os próprios parênteses)
 * e sufixos como " - AGN" do nome do cliente/usuário para envio pelo WhatsApp.
 * Exemplos:
 *   "Bosco (AGN)" -> "Bosco"
 *   "Lúcia (Professora)" -> "Lúcia"
 *   "Maria Silva - AGN" -> "Maria Silva"
 */
export const cleanCustomerNameForWhatsapp = (name: string = ''): string => {
    return name
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\s*[-–—]\s*AGN\b/gi, '')
        .replace(/[()]/g, '')
        .trim();
};
