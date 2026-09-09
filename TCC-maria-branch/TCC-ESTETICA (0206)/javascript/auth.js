
const supabaseUrl = 'https://sfeyadawliakzyjtllpb.supabase.co';
const supabaseAnonKey = 'sb_publishable_kXJ1yBHM8aECG_13u2u3vA_2N7F0Weo';

const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Código de cadastro de clientes
export async function signup(name, phone, email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: name,
                    phone: phone,
                    role: 'cliente'
                }
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            user: data.user
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
// Código de cadastro de clientes



// Código de login de clientes
export async function signin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            user: data.user
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
// Código de login de clientes



// Código de cadastro de agendamentos
export async function agendarServico(nomeCliente, procedimento, horario, dataAgendamento) {
    try {
        // 1. Obtém o usuário atualmente logado no Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error("Você precisa estar logado para realizar um agendamento.");
        }

        // 2. Insere o agendamento no banco com as colunas exatas da tabela
        const { data, error } = await supabase
            .from('agendamentos')
            .insert([
                {
                    perfil_id: user.id,            // FK para a tabela profiles(id)
                    nome_cliente: nomeCliente,     // Ex: "Maria Silva"
                    procedimento: procedimento,   // Ex: "Limpeza de Pele"
                    horario: horario,             // Ex: "14:30:00" (formato time)
                    data: dataAgendamento         // Ex: "2026-09-10" (formato date)
                }
            ]);

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            data: data
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
// Código de cadastro de agendamentos




// Código de consulta de agendamentos
export async function buscarMeusAgendamentos() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Usuário não autenticado.");
        }

        const { data, error } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('perfil_id', user.id);

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            agendamentos: data
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
// Código de consulta de agendamentos


// Código de login com Google
export async function signInWithGoogle() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // A URL para onde o usuário volta após o login
                redirectTo: 'http://127.0.0.1:5500/TCC-ESTETICA (0206)/index.html' 
            }
        });

        if (error) {
            throw new Error(error.message);
        }
        
    } catch (error) {
        console.error("Erro no login com Google:", error.message);
        alert("Erro ao tentar conectar com o Google: " + error.message);
    }
}