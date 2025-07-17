import * as cheerio from 'cheerio';

export async function scrapeBeers() {
	let page = 1;
	const beers = [];

	while (true) {
		const url = `https://www.drankgigant.nl/bieren/speciaalbieren?p=${page}&product_list_order=created_at`;
		const data = await fetch(url);
		const html = await data.text();
		const $ = cheerio.load(html);

		const products = $('.products-list > div > form');

		if (products.length === 0) {
			// No more beers on next page
			break;
		}

		products.each((_, el) => {
			const title = $(el).find('.mobile-product-name .product-item-link').text().trim();
			const link = $(el).find('.link-wrapper').attr('href');
			const img = $(el).find('picture img').attr('src');

			// ignore new price if old price is available (new price means theres a sale going on)
			const finalPrice = $(el)
				.find('.product-info .price-box .price-wrapper')
				.attr('data-price-amount');
			const oldPrice = $(el)
				.find('.product-info .price-box .old-price .price-wrapper')
				.attr('data-price-amount');

			const price = oldPrice ?? finalPrice;

			if (title && link && price) {
				beers.push({ title, link, img, price });
			}
		});

		page++;
	}

	return beers;
}
