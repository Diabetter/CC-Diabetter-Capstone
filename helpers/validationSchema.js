import Joi from "joi";

export const registerSchema = Joi.object({
	name: Joi.string()
	.regex(/^[a-zA-Z]+$/)
	.max(30)
	.required(),

	email: Joi.string()
	.lowercase()
	.email({minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ru'] } })
	.required(),

	password: Joi.string()
	.min(2)
	.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
	.required(),

	passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required(),
});

export const loginSchema = Joi.object({
	email: Joi.string()
	.lowercase()
	.email({minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ru'] } })
	.required(),

	password: Joi.string()
	.min(2)
	.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
	.required(),

});
