import { get_encoding } from "tiktoken";
const encoderForGpt2 = get_encoding("gpt2");
const encodedL = encoderForGpt2.encode("Hello, I am Manish Parmar");
console.log(encodedL);
const decodedL = encoderForGpt2.decode(encodedL);
console.log(decodedL);
const NL = new TextDecoder().decode(decodedL);
console.log(NL);