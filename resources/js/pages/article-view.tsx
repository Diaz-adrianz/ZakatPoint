import Container from "@/components/container"
import VisitorLayout from "@/layouts/visitor-layout"
import { Article } from "@/types/model"
import moment from 'moment'
import { useMemo } from "react"
import DOMPurify from 'dompurify'
import { Separator } from "@/components/ui/separator"

const ArticleView = ({article}: {article: Article}) => {

    const safeContent = useMemo(
        () => DOMPurify.sanitize(article?.content ?? ''),
        [article?.content]
      );
    
  return (
    <VisitorLayout>
        <Container className="flex flex-col gap-6">
            <h1 className="typo-h1">{article.title}</h1>

            <div className="flex w-fit flex-col">
                <small className="!typo-small text-muted-foreground">Ditulis oleh</small>
                <h4 className="typo-h4">{article.village?.village}</h4>
                <p className="typo-p text-muted-foreground lowercase">
                    {article.village?.district} • {article.village?.city} • {article.village?.province}
                </p>
                <Separator className="my-3"/>
                <p className="typo-p text-muted-foreground">{moment(article.created_at).fromNow()}</p>
            </div>

            <div
                className="ql-editor !p-0"
                dangerouslySetInnerHTML={{ __html: safeContent ?? '' }}
            ></div>
        </Container>
    </VisitorLayout>
  )
}

export default ArticleView