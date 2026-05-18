export interface UserRegister{
email:string,
username:string,
password :string
}

export interface UserLogin{
    username:string,
    password:string
}

export interface AddUser{
email:string,
username:string,
password :string,
user_type_id:number
}

export interface getUser{
user_id:number,
email:string,
username:string,
password :string,
user_type_id:number
}

export interface getOneUser{
user_id:number,
email:string,
username:string,
password :string,
user_type_id:number,
createdAt:string
}



export interface editUser{
email:string,
username:string,
password :string,
user_type_id:number
}
