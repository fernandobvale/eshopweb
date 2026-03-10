import bcrypt from "bcryptjs";

export interface LocalAdminConfig {
    email: string;
    passwordHash: string;
}

export function getLocalAdminConfig(): LocalAdminConfig {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const passwordHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();

    if (!email || !passwordHash) {
        throw new Error("ADMIN_EMAIL e ADMIN_PASSWORD_HASH precisam estar configurados.");
    }

    return { email, passwordHash };
}

export async function validateLocalAdminCredentials(email: string, password: string) {
    const config = getLocalAdminConfig();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== config.email) {
        return false;
    }

    return bcrypt.compare(password, config.passwordHash);
}
