/**
 * Ejemplo de uso en Remix (action de validación de formulario)
 *
 * Coloca este archivo en app/routes/ y úsalo para validar
 * RUCs ingresados por usuarios.
 */

import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { validate } from "@workflow507/panama-ruc";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const ruc = formData.get("ruc")?.toString() ?? "";
  const dv = formData.get("dv")?.toString();

  const result = validate(ruc, dv);

  if (!result.valid) {
    return json(
      {
        ok: false,
        error: result.code,
        message: result.message,
        expected: result.expected,
      },
      { status: 400 },
    );
  }

  return json({
    ok: true,
    dv: result.dv,
    type: result.type,
  });
}
