const utility = {
    getFixedLengthBuffers(buffer, offset, length, number) {
        const buffers = new Array(number);
        let i = 0;
        while (i < number) {
            const end = offset + length;
            buffers[i] = buffer.subarray(offset, end);
            offset = end;
            i += 1;
        }
        return buffers;
    },
    getVariableLengthBuffers(buffer, offset, end, splitCode) {
        const buffers = [];
        let inBuffer = false;
        let start;
        while (offset < end) {
            if (inBuffer) {
                if (buffer[offset] === splitCode) {
                    buffers.push(buffer.subarray(start, offset));
                    inBuffer = false;
                }
            } else {
                if (buffer[offset] !== splitCode) {
                    start = offset;
                    inBuffer = true;
                }
            }
            offset += 1;
        }
        if (inBuffer) {
            buffers.push(buffer.subarray(start, end));
        }
        return buffers;
    }
};
