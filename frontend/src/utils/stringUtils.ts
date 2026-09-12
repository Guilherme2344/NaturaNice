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
