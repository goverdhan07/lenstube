import { useMutation } from '@apollo/client'
import MetaTags from '@components/Common/MetaTags'
import { Button } from '@components/UIElements/Button'
import { CREATE_REPORT_PUBLICATION_MUTATION } from '@gql/queries'
import { ERROR_MESSAGE } from '@utils/constants'
import { Mixpanel, TRACK } from '@utils/track'
import clsx from 'clsx'
import React, { FC, useState } from 'react'
import toast from 'react-hot-toast'
import { LenstubePublication } from 'src/types/local'

type Props = {
  publication: LenstubePublication
  onSuccess: () => void
}

const ReportPublication: FC<Props> = ({ publication, onSuccess }) => {
  const [reason, setReason] = useState('ILLEGAL-ANIMAL_ABUSE')
  const [createReport, { loading: reporting }] = useMutation(
    CREATE_REPORT_PUBLICATION_MUTATION,
    {
      onError(error: any) {
        toast.error(error?.data?.message ?? error?.message ?? ERROR_MESSAGE)
      },
      onCompleted() {
        Mixpanel.track(TRACK.REPORT)
        toast.success('Publication reported successfully.')
        onSuccess()
      }
    }
  )

  const getReasonType = (type: string) => {
    if (type === 'ILLEGAL') return 'illegalReason'
    if (type === 'FRAUD') return 'fraudReason'
    if (type === 'SENSITIVE') return 'sensitiveReason'
    if (type === 'SPAM') return 'spamReason'
    return 'illegalReason'
  }

  const onReport = () => {
    const type = reason.split('-')[0]
    const subReason = reason.split('-')[1]
    createReport({
      variables: {
        request: {
          publicationId: publication.id,
          reason: {
            [getReasonType(type)]: {
              reason: type,
              subreason: subReason
            }
          },
          additionalComments: `${type} - ${subReason}`
        }
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReason(e.target.value)
  }

  return (
    <>
      <MetaTags title="Report Publication" />
      <div className="flex justify-center">
        <div className="w-full">
          <div className="opacity-60">
            <h1>{publication.metadata.name}</h1>
            <span className="text-sm italic">
              by {publication.profile.handle}
            </span>
          </div>
          <div className="mt-4">
            <label
              className="block text-xs font-semibold uppercase opacity-70"
              htmlFor="report"
            >
              Reason
            </label>
            <div className="mt-1">
              <select
                onChange={(e) => handleChange(e)}
                value={reason}
                name="report"
                className={clsx(
                  'bg-white text-sm p-2.5 rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 disabled:opacity-60 disabled:bg-gray-500 disabled:bg-opacity-20 outline-none w-full'
                )}
                id="report"
              >
                <optgroup label="SPAM">
                  <option value="SPAM-FAKE_ENGAGEMENT">Fake Engagement</option>
                  <option value="SPAM-MANIPULATION_ALGO">
                    Algorithm Manipulation
                  </option>
                  <option value="SPAM-MISLEADING">Misleading</option>
                  <option value="SPAM-MISUSE_HASHTAGS">Misuse Hashtags</option>
                  <option value="SPAM-REPETITIVE">Repetitive</option>
                  <option value="SPAM-UNRELATED">Unrelated</option>
                  <option value="SPAM-SOMETHING_ELSE">Something Else</option>
                </optgroup>
                <optgroup label="ILLEGAL">
                  <option value="ILLEGAL-ANIMAL_ABUSE">Animal Abuse</option>
                  <option value="ILLEGAL-HUMAN_ABUSE">Human Abuse</option>
                  <option value="ILLEGAL-DIRECT_THREAT">Direct threat</option>
                  <option value="ILLEGAL-THREAT_INDIVIDUAL">
                    Threat Individual
                  </option>
                  <option value="ILLEGAL-VIOLENCE">Violence</option>
                </optgroup>
                <optgroup label="FRAUD">
                  <option value="FRAUD-SCAM">Scam</option>
                  <option value="FRAUD-IMPERSONATION">Impersonation</option>
                </optgroup>
                <optgroup label="SENSITIVE">
                  <option value="SENSITIVE-NSFW">NSFW</option>
                  <option value="SENSITIVE-OFFENSIVE">Offensive</option>
                </optgroup>
              </select>
            </div>
            <div className="flex justify-end mt-4 mb-1">
              <Button
                disabled={reporting}
                loading={reporting}
                onClick={() => onReport()}
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReportPublication
