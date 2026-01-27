package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
    private Long id;
    private String city;
    private String street;

    public static AddressDto fromEntity(com.schoolOps.SchoolOPS.entity.Address address) {
        if (address == null) return null;
        return new AddressDto(
            address.getId(),
            address.getCity(),
            address.getStreet()
        );
    }
}