import { Dispatch, Fragment, memo, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { Appbar, Searchbar } from "react-native-paper";

const AppBarSearchBox = ({
  searchVisible,
  setSearchVisible,
  searchValue,
  setSearchValue,
}: {
  searchVisible: boolean;
  setSearchVisible: Dispatch<SetStateAction<boolean>>;
  searchValue: string;
  setSearchValue: (value: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Appbar.Action
        icon="magnify"
        onPress={() => setSearchVisible((a) => !a)}
      />
      {searchVisible && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: 8,
            zIndex: 10,
          }}
          onPress={() => {
            setSearchVisible(true);
          }}
          onLongPress={() => {
            setSearchVisible(false);
          }}
        >
          <Searchbar
            placeholder={t("search_dish")}
            value={searchValue}
            onChangeText={setSearchValue}
            autoFocus
            inputStyle={{
              padding: 0,
              minHeight: "auto",
            }}
            style={{
              padding: 0,
              height: 46,
              alignContent: "center",
            }}
          />
        </Pressable>
      )}
    </Fragment>
  );
};

export default memo(AppBarSearchBox);
