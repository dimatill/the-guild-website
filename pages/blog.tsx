/* eslint-disable react/no-unescaped-entities */
import { FC } from 'react';
import styled from 'styled-components';
import { GetStaticProps } from 'next/types';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { format } from 'date-fns';
import { Page } from '../ui/shared/Page';
import { Container } from '../ui/shared/Layout';
import { Newsletter } from '../ui/blog/newsletter';
import { MetaWithLink, pickAuthor } from '../lib/meta';
import { getAllArticles } from '../lib/get-all-articles';
import { authors } from '../ui/authors';
import { HeroSection } from '../ui/hero-section';
import { Description, Heading } from '../ui';
import { BlogCard } from '../ui/recommended-reading-section';
import { TagContainers } from '../ui/blog/article';
import { Tag } from '../ui/blog/tag';

interface Props {
  articles: MetaWithLink[];
  tagFilter?: string[];
}

const NewsletterContainer = styled(Container)`
  padding-top: 30px;
`;

export const AllArticles = styled(Container)`
  padding: 125px 0;
  display: grid;
  grid-column-gap: 40px;
  grid-row-gap: 70px;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
`;

function extractRelevantTags(articles: Props['articles']) {
  const allTags = articles
    .reduce((acc, article) => [...acc, ...(article.tags || [])], [])
    .filter(Boolean);

  const map = new Map<string, number>();

  for (const tag of allTags) {
    map.set(tag, (map.get(tag) || 0) + 1);
  }

  // nasty
  map.set('codegen', 100);
  map.set('envelop', 100);

  const sorted = Array.from(map).sort((a, b) => b[1] - a[1]);

  return sorted.slice(0, 10).map((v) => v[0]);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      articles: await getAllArticles(),
    },
  };
};

const Blog: FC<Props> = ({ articles, tagFilter }) => {
  const hasTagFilter = tagFilter && tagFilter.length > 0;
  const allTags = extractRelevantTags(articles);

  const title = hasTagFilter
    ? `The Guild Blog - ${tagFilter.join(', ')}`
    : 'The Guild Blog';
  const description = hasTagFilter
    ? `List of articles related to ${tagFilter.join(', ')}`
    : `Announcements about our Open-Source projects`;

  return (
    <Page title={title} description={description} image="/img/ogimage.png">
      <HeroSection>
        <Heading>The Guild's blog</Heading>
      </HeroSection>
      <TagContainers>
        {allTags.map((t) => (
          <Tag tag={t} key={t} asLink />
        ))}
      </TagContainers>
      {/* {recentArticle && !hasTagFilter && (
        <Section noNotch>
          <SectionContainer>
            <Featured
              title={recentArticle.title}
              description={recentArticle.description}
              image={recentArticle.thumbnail || recentArticle.image}
              link={recentArticle.link}
            />
          </SectionContainer>
        </Section>
      )} */}
      {!hasTagFilter && (
        <NewsletterContainer>
          <Newsletter />
        </NewsletterContainer>
      )}
      <AllArticles>
        {articles?.map((article) => (
          <BlogCard key={article.title} href={article.link}>
            {/*<img src={article.image} css={tw`max-w-[278px] max-h-[164px]`} />*/}
            <div
              css={[
                css`
                  background-image: url(${article.image});
                `,
                tw`w-full h-full max-w-[278px] max-h-[164px] bg-cover bg-center bg-no-repeat flex-shrink-0`,
              ]}
            />
            <div css={[tw`p-5`]}>
              <Heading $size="md">{article.title}</Heading>
              <Description
                $size="md"
                css={tw`overflow-ellipsis overflow-hidden max-h-[48px]`}
              >
                {article.description}
              </Description>
              <div css={tw`text-xs `}>
                <span css={tw`text-gray-200 font-bold`}>
                  {authors[pickAuthor(article)].name}
                </span>
                <span css={tw`text-gray-500`}>
                  {' '}
                  • {format(new Date(article.date), 'LLL do y')}
                </span>
              </div>
            </div>
          </BlogCard>
        ))}
      </AllArticles>
    </Page>
  );
};

export default Blog;
