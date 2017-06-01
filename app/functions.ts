//encodes a string in base64
export function btoa(input: string): string {
    return new Buffer(input).toString('base64');
}