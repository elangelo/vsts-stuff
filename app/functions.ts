namespace vstsstuff {
    //encodes a string in base64
    function btoa(input: string): string {
        return new Buffer(input).toString('base64');
    }
}