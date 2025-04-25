package cit.edu.cartella.service;

import cit.edu.cartella.entity.Address;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.AddressRepository;
import cit.edu.cartella.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Autowired
    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserUserId(userId);
    }

    @Transactional
    public Address createAddress(Long userId, Address address) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        address.setUser(user);
        
        // Set timestamps
        address.setCreatedAt(LocalDateTime.now());
        address.setUpdatedAt(LocalDateTime.now());
        
        // If this is the first address or isDefault is true, set it as default
        List<Address> existingAddresses = addressRepository.findByUserUserId(userId);
        if (existingAddresses.isEmpty() || address.isDefault()) {
            address.setDefault(true);
            
            // If this is set as default, unset any other default addresses
            if (!existingAddresses.isEmpty()) {
                for (Address existingAddress : existingAddresses) {
                    if (existingAddress.isDefault()) {
                        existingAddress.setDefault(false);
                        addressRepository.save(existingAddress);
                    }
                }
            }
        }
        
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long addressId, Address addressDetails) {
        Optional<Address> addressOpt = addressRepository.findById(addressId);
        if (addressOpt.isEmpty()) {
            throw new RuntimeException("Address not found");
        }
        
        Address address = addressOpt.get();
        
        // Update fields
        if (addressDetails.getStreetAddress() != null) {
            address.setStreetAddress(addressDetails.getStreetAddress());
        }
        if (addressDetails.getCity() != null) {
            address.setCity(addressDetails.getCity());
        }
        if (addressDetails.getState() != null) {
            address.setState(addressDetails.getState());
        }
        if (addressDetails.getPostalCode() != null) {
            address.setPostalCode(addressDetails.getPostalCode());
        }
        if (addressDetails.getCountry() != null) {
            address.setCountry(addressDetails.getCountry());
        }
        
        // Update timestamp
        address.setUpdatedAt(LocalDateTime.now());
        
        return addressRepository.save(address);
    }

    @Transactional
    public Address setDefaultAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Address not found"));

        Long userId = address.getUser().getUserId();
        List<Address> userAddresses = addressRepository.findByUserUserId(userId);

        // Set all addresses to non-default first
        for (Address addr : userAddresses) {
            addr.setDefault(false);
        }

        // Set the selected address as default
        address.setDefault(true);
        address.setUpdatedAt(LocalDateTime.now());

        // Save all changes in a single transaction
        addressRepository.saveAll(userAddresses);
        
        // Log for debugging
        System.out.println("Set default address: " + addressId);
        System.out.println("Total addresses updated: " + userAddresses.size());
        
        // Return the updated default address
        return addressRepository.findById(addressId)
            .orElseThrow(() -> new RuntimeException("Address not found after update"));
    }

    public void deleteAddress(Long addressId) {
        addressRepository.deleteById(addressId);
    }
} 