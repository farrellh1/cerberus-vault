import { IsArray, IsEnum, IsEthereumAddress, IsNotEmpty } from "class-validator";
import { NetworkType } from "src/commons/enums";

export class CreateWalletDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEnum(NetworkType)
    network: NetworkType

    @IsNotEmpty()
    @IsArray()
    @IsEthereumAddress({
        each: true
    })
    addresses: string[];
}
