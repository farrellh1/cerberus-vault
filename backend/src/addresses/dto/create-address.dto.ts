import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class CreateAddressDto {
    @IsNotEmpty()
    @IsEthereumAddress()
    address: string;
}
