import React from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, DataTable, Card, Surface } from "react-native-paper";

const InvoicePage = () => {
  return (
    <Surface>
      <ScrollView style={{ padding: 16, backgroundColor: "#fff" }}>
        <View>
          <Button>Huỷ thanh toán</Button>
        </View>
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            MewO
          </Text>
          <Text>0985698526</Text>
          <Text>Mã HĐ: 20250602-0021</Text>
          <Text>Khách lẻ: N/A</Text>
          <Text>Phục vụ: Quyết 2</Text>
          <Text>Giờ vào: 4:54 PM 02/06/2025</Text>
          <Text>Số người: 1 - Bàn 5A</Text>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text variant="titleMedium">Tên sản phẩm</Text>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>SL</DataTable.Title>
              <DataTable.Title numeric>Đ.Giá</DataTable.Title>
              <DataTable.Title numeric>T.Tiền</DataTable.Title>
            </DataTable.Header>

            <DataTable.Row>
              <DataTable.Cell>Pizza Hải Sản Pesto Xanh</DataTable.Cell>
              <DataTable.Cell numeric>1</DataTable.Cell>
              <DataTable.Cell numeric>289,000 đ</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text variant="titleMedium">Tổng số tiền</Text>
          <View style={{ marginTop: 8 }}>
            <Text>Chiết khấu: -0 đ</Text>
            <Text>Thuế (8%): 21,520 đ</Text>
            <Text>Thẻ tích điểm: -0 đ</Text>
            <Text>CTKM: Giảm 20k - Số lượng 1: 20,000 đ</Text>
            <Text>Thời gian (10%): +31,212 đ</Text>
            <Text>Service (10%): +31,376 đ</Text>
          </View>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text variant="titleMedium">Tổng thanh toán</Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>
            353,108 đ
          </Text>
          <Text>Điểm thưởng: 0 điểm</Text>
          <Text>Hình thức thanh toán: Tiền mặt</Text>
        </Card>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <Button mode="contained-tonal">Lịch sử chỉnh sửa</Button>
          <Button mode="contained">PDF</Button>
        </View>
      </ScrollView>
      <View></View>
    </Surface>
  );
};

export default InvoicePage;
