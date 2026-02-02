-- ============================================================================
-- SOLUÇÃO PARA ERRO DE LOGIN (RLS)
-- Rode este script no "SQL Editor" do seu Supabase para criar a função de login segura.
-- ============================================================================

CREATE OR REPLACE FUNCTION login_cliente(p_email text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Permite ler a tabela mesmo com RLS ativado
SET search_path = public
AS $$
DECLARE
    found_user RECORD;
BEGIN
    -- Busca o usuário ignorando maiúsculas/minúsculas no email
    SELECT * INTO found_user
    FROM clientes_meu_auxiliar
    WHERE email ILIKE p_email
    AND "Senha" = p_password
    LIMIT 1;

    -- Se não achar, retorna null
    IF found_user IS NULL THEN
        RETURN NULL;
    END IF;

    -- Se achar, retorna os dados da sessão
    RETURN json_build_object(
        'email', found_user.email,
        'session_id', found_user.session_id,
        'created_at', found_user.created_at
    );
END;
$$;
