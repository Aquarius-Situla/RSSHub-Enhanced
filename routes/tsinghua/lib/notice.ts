import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/tsinghua/lib/notice',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lib.tsinghua.edu.cn/tzgg.htm', 'lib.tsinghua.edu.cn/'],
            target: '/notice',
        },
    ],
    name: '通知公告',
    maintainers: ['Aquarius-Situla'],
    handler,
};

async function handler() {
    const baseUrl = 'https://lib.tsinghua.edu.cn';
    const link = `${baseUrl}/tzgg.htm`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('ul.notice-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.notice-list-tt a');
            const title = a.text().trim();
            const href = a.attr('href');
            const dateStr = $item.find('.notice-date').text().trim();
            const category = $item.find('.notice-label').text().trim();

            return {
                title: `[${category}] ${title}`,
                // href is like "info/1071/8118.htm"
                link: new URL(href, link).href,
                pubDate: parseDate(dateStr, 'YYYY/MM/DD'),
                category,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    
                    // .v_news_content is the main content wrapper based on standard VSB templates
                    item.description = $('.v_news_content').html() || '无正文内容';
                } catch (e) {
                    item.description = '无法获取正文内容';
                }
                return item;
            })
        )
    );

    return {
        title: '清华大学图书馆 - 通知公告',
        link,
        item: items,
    };
}
