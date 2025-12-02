interface IProfessionalDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  approved?: boolean;
  accountType?: string;
  verified?: boolean;
}

export class ProfessionalDTO {
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _password: string;
  private _approved: boolean;
  private _accountType: string;
  private _verified: boolean;

  constructor({
    firstName,
    lastName,
    email,
    password,
    approved = false,
    accountType = "professional", //TODO: account types enum
    verified = false,
  }: IProfessionalDTO) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._password = password;
    this._approved = approved;
    this._accountType = accountType;
    this._verified = verified;
  }

  static fromRequestBody(body: IProfessionalDTO): Partial<IProfessionalDTO> {
    return {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
    };
  }
}
