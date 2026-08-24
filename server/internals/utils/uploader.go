package utils

import (
	"context"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/joho/godotenv"
)

func initCloudinary() (*cloudinary.Cloudinary, context.Context, error) {
	godotenv.Load()
	// Add your Cloudinary credentials, set configuration parameter
	// Secure=true to return "https" URLs, and create a context
	cloudinaryUrl := os.Getenv("CLOUDINARY_URL")
	cld, err := cloudinary.NewFromURL(cloudinaryUrl)
	if err != nil {
		return nil, nil, err
	}

	cld.Config.URL.Secure = true
	ctx := context.Background()
	return cld, ctx, nil
}

// upload image to cloudinary and returns url or error
func UploadImg(fileSource any, folder string, publicId string) (string, error) {
	cld, ctx, err := initCloudinary()
	if err != nil {
		return "", err
	}

	uniqueFilename := false
	overrite := true
	uploadParams := uploader.UploadParams{
		Folder:         folder,
		PublicID:       publicId,
		UniqueFilename: &uniqueFilename,
		Overwrite:      &overrite,
	}
	// Set the asset's public ID and allow overwriting the asset with new versions
	resp, err := cld.Upload.Upload(ctx, fileSource, uploadParams)
	if err != nil {
		return "", err
	}
	return resp.SecureURL, nil
}
