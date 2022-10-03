module.exports = class Converter {
  constructor({ sharp, s3, environment }) {
    this.sharp = sharp;
    this.s3 = s3;
    this.environment = environment;
  }

  async convertAndStore(base64, mimeType) {
    const key = Date.now();
    let fileForS3;
    let extension;

    if (mimeType === 'image/tiff') {
      fileForS3 = await this.sharp(Buffer.from(base64, 'base64'))
        .jpeg({ mozjpeg: true })
        .toBuffer();
      extension = 'jpg';
    }

    if (mimeType === 'application/pdf') {
      fileForS3 = Buffer.from(base64, 'base64');
      extension = 'pdf';
    }

    const fileName = `${key}.${extension}`;
    await this.s3.putObject({
      Bucket: this.environment.getFileBucket(),
      Key: fileName,
      Body: fileForS3
    }).promise();

    return fileName;
  }
};
