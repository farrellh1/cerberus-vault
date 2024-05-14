import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class FindAllQueryDto {
    @IsEthereumAddress()
    @IsNotEmpty()
    ownerAddress: string
}