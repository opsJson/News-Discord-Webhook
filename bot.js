const { EmbedBuilder, WebhookClient } = require("discord.js");
const cheerio = require("cheerio");

const posted = [];
const url = "webhook-url";
const webhookClient = new WebhookClient({url});

async function scrap(url, func) {
	try {
		const response = await fetch(url);
		const html = await response.text();
		const $ = cheerio.load(html);
		const articles = $("article");
		
		articles.each((index, article) => {
			const obj = func($(article));
			
			if (!posted.includes(obj.url)) {
				if (posted.length > 50) posted.unshift();
				posted.push(obj.url);
			}
			else return;
					
			const embed = new EmbedBuilder()
				.setTitle(obj.title)
				.setDescription(obj.description)
				.setURL(obj.url)
				.setImage(obj.image || undefined)
				.setColor(obj.color || 0xFBD007)
				.setFooter({text: obj.footer, iconURL: obj.iconURL});

			webhookClient.send({
				embeds: [embed]
			});
		});
	}
	catch (e) {
		console.error(e);
	}
}

function scheduler() {
	scrap("https://pousoalegre.net/", (article) => {
		
		return {
			title: 			article.find("h2 > b").text(),
			description: 	article.find("h3").text() + "\n\n" + article.find("a").attr("title"),
			image: 			article.find("img").attr("src"),
			url: 			article.find("a").attr("href"),
			color: 			0xFFFFFF,
			footer: 		"pousoalegre.net",
			iconURL: 		"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7hAm3d2YWf0RwONx3-kvQSpFbNJn_8ucqY-Hkb0eLGZAiunr8d4NXGjdOWMRxwFOexz8&usqp=CAU"
		};
	});

	scrap("https://thenewscc.com.br/blog/", (article) => {
		
		return {
			title: 			article.find(".elementor-post__title > a").text(),
			description: 	article.find(".elementor-post__excerpt > p").text(),
			image: 			article.find(".elementor-post__thumbnail > img")?.attr("src"),
			url:  			article.find(".elementor-post__title > a").attr("href"),
			color: 			0xFBD007,
			footer: 		"The News",
			iconURL: 		"https://thenewscc.com.br/wp-content/uploads/2021/10/mug_logo.png"
		};
	})
}

setInterval(scheduler, 1000 * 60 * 60);
scheduler();