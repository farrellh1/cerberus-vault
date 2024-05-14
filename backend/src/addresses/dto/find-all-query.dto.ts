import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class FindAllQueryDto {
    @IsNotEmpty()
    @IsEthereumAddress()
    walletAddress: string
}