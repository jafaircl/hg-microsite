import { HgMicrositePage } from './app.po';

describe('hg-microsite App', () => {
  let page: HgMicrositePage;

  beforeEach(() => {
    page = new HgMicrositePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
