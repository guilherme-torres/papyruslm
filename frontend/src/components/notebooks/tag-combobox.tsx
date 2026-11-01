import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox'

const TAG_NAME_MAX_LENGTH = 100

interface TagComboboxProps {
    id?: string
    options: string[]
    value: string[]
    onValueChange: (value: string[]) => void
    disabled?: boolean
}

export function TagCombobox({ id, options, value, onValueChange, disabled }: TagComboboxProps) {
    const { t } = useTranslation()
    const anchor = useComboboxAnchor()
    const [inputValue, setInputValue] = useState('')
    const typedTag = inputValue.trim()
    const isNewTag = typedTag !== '' && !options.includes(typedTag) && !value.includes(typedTag)
    const items = [...new Set([...options, ...value, ...(isNewTag ? [typedTag] : [])])]

    return (
        <Combobox
            multiple
            autoHighlight
            items={items}
            value={value}
            onValueChange={(tags: string[]) => onValueChange(tags.map((tag) => tag.trim()))}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            disabled={disabled}
        >
            <ComboboxChips ref={anchor}>
                <ComboboxValue>
                    {(selected: string[]) => (
                        <Fragment>
                            {selected.map((tag) => (
                                <ComboboxChip key={tag} aria-label={tag}>
                                    {tag}
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput
                                id={id}
                                maxLength={TAG_NAME_MAX_LENGTH}
                                placeholder={selected.length > 0 ? undefined : t('notebooks.tagPlaceholder')}
                            />
                        </Fragment>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{t('notebooks.tagEmpty')}</ComboboxEmpty>
                <ComboboxList>
                    {(tag: string) => (
                        <ComboboxItem key={tag} value={tag}>
                            {isNewTag && tag === typedTag ? t('notebooks.createTag', { tag }) : tag}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
