import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://danir-app.my.id',
            lastModified: new Date(),
        },
    ]
}